from __future__ import annotations

from ast import parse, AST, FunctionDef, Call, Name, walk, List, Str, Module
from pydantic.dataclasses import dataclass
from typing import Union

from fal_serverless_vscode.util import import_module

@dataclass
class IsolateNodeParams:
    machine_type: Union[str, None]
    requirements: list[str]

@dataclass
class LineReference:
    start_line: int
    start_col: int
    end_line: int
    end_col: int

    @classmethod
    def from_node(cls, node: AST):
        return cls(
            start_line=node.lineno,
            start_col=node.col_offset,
            end_line=node.end_lineno,
            end_col=node.end_col_offset,
        )

@dataclass
class IsolateNode:
    line: LineReference
    params: IsolateNodeParams

@dataclass
class IsolateFunctionNode:
    line: LineReference
    file: str
    name: str
    isolate_node: IsolateNode


def get_isolate_nodes(file_path: str) -> list[IsolateFunctionNode]:
    with open(file_path, 'r', encoding='utf-8') as file:
        source = file.read()

    tree = parse(source)

    functions: list[IsolateFunctionNode] = []
    for node in walk(tree):
        if isinstance(node, FunctionDef):
            isolate_decorator = __get_isolated_decorator(node)
            if isolate_decorator:
                functions.append(IsolateFunctionNode(
                    line=LineReference.from_node(node),
                    file=file_path,
                    name=node.name,
                    isolate_node=isolate_decorator
                ))
    return functions


def __get_isolated_decorator(function: FunctionDef) -> IsolateNode | None:
    return next(
        IsolateNode(
            line=LineReference.from_node(decorator),
            params=__parse_isolate_decorator(decorator)
        )
        for decorator in function.decorator_list
        if (isinstance(decorator, Call) and
            isinstance(decorator.func, Name) and
            decorator.func.id == 'isolated'
        )
    )


def __parse_isolate_decorator(decorator: Call) -> IsolateNodeParams:
     # Access the attributes (keyword arguments) of the decorator
    attributes = {kw.arg: kw.value for kw in decorator.keywords}

    # Access the 'requirements' attribute
    requirements = attributes.get("requirements")
    if requirements:
        # Ensure 'requirements' is a list of strings

        if isinstance(requirements, Name):
            ...
        if not isinstance(requirements, List) or not all(isinstance(elt, Str) for elt in requirements.elts):
            raise ValueError("The 'requirements' attribute must be a list of strings")
        requirements = [elt.s for elt in requirements.elts]
    else:
        requirements = []

    # Access the 'machine_type' attribute
    machine_type = attributes.get("machine_type")
    if machine_type:
        # Ensure 'machine_type' is a string
        if not isinstance(machine_type, Str):
            raise ValueError("The 'machine_type' attribute must be a string")
        machine_type = machine_type.s
    return IsolateNodeParams(
        machine_type=machine_type,
        requirements=requirements
    )
