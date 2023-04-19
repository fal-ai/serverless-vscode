import sys

from fal_serverless_vscode.isolate import create_env

if __name__ == "__main__":
    requirements = sys.argv[1]
    env = create_env(requirements=requirements.split(","))
    print(env)
