from dataclasses import asdict
from json import dumps as json_dump

from fal_serverless_vscode.isolate import get_isolate_nodes
from fal_serverless_vscode.util import get_module

if __name__ == "__main__":
    file_path = get_module()
    functions = get_isolate_nodes(file_path)
    json_content = json_dump(
        [asdict(function) for function in functions], sort_keys=False
    )
    print(json_content)
