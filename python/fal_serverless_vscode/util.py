import os
import sys
from importlib.util import module_from_spec, spec_from_file_location
from typing import Tuple


def get_module() -> str:
    if len(sys.argv) >= 2:
        file_path = sys.argv[1]
        return file_path
    else:
        raise ValueError("Must pass at least one argument: `module_path`")


def get_module_and_function() -> Tuple[str, str]:
    if len(sys.argv) >= 3:
        file_path = sys.argv[1]
        function_name = sys.argv[2]
        return (file_path, function_name)
    else:
        raise ValueError("Must pass two arguments: `module_path` and `function_name`")


def get_module_name(module_path: str) -> str:
    parent_folder = os.path.basename(os.path.dirname(module_path))
    file_name = os.path.splitext(os.path.basename(module_path))[0]

    return f"{parent_folder}.{file_name}"


def import_module(module_path: str):
    module_name = get_module_name(module_path)
    spec = spec_from_file_location(module_name, module_path)

    if not spec:
        raise ModuleNotFoundError(name=module_name, path=module_path)

    module = module_from_spec(spec)

    sys.modules[spec.name] = module
    loader = spec.loader
    if not loader:
        raise ModuleNotFoundError(name=module_name, path=module_path)
    loader.exec_module(module)

    return module
