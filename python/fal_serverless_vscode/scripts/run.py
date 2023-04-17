import sys

from importlib.util import module_from_spec, spec_from_file_location
from typing import Callable

from fal_serverless_vscode.util import get_module_and_function

def import_function(module_path: str, function_name: str) -> Callable:
    spec = spec_from_file_location("module.name", module_path)
    module = module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)

    function = getattr(module, function_name)
    if not isinstance(function, Callable):
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
