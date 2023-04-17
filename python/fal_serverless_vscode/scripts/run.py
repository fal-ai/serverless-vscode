from __future__ import annotations

from typing import Callable

from fal_serverless_vscode.util import get_module_and_function, import_module


def import_function(module_path: str, function_name: str) -> Callable:
    module = import_module(module_path)

    function = getattr(module, function_name)
    if not isinstance(function, Callable):  # type: ignore[arg-type]
        raise TypeError(f"Function {function_name} not found on {module_path}")
    return function


if __name__ == "__main__":
    (file_path, function_name) = get_module_and_function()
    function = import_function(module_path=file_path, function_name=function_name)
    # TODO handle arguments (inspect and prompt?)
    print(f"Calling {function_name}...")
    result = function()
    print("The result is:")
    print(result)
