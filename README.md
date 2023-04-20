# A fal-serverless extension for Visual Studio Code

This is the fal-serverless extension for Visual Studio Code. It provides a better developer experience for fal-serverless developers by managing `@isolated` environments automatically so VS Code can resolve modules.

Read more about fal-serverless [here](https://docs.fal.ai/fal-serverless/quickstart).

## Features

- Auto create and manage virtual environments for the fal-serverless `@isolated` functions.
- Allows you to run the fal-serverless `@isolated` functions in the cloud with a click.

### Known limitations and issues

- A system Python and virtualenv needs to be available.
- Python environment is not restored when a file with no isolated functions is opened.
- Functions with arguments are not supported yet when running from the editor.

### Coming soon

- Run functions with arguments.
- Schedule `@isolated` functions from the editor.
- Run `@isolated` functions _locally_ with a click.
- Serve (i.e. create a web endpoint) for `@isolated` functions with a click.


### Before vs After

| Before | After |
| --- | --- |
| ![Before](https://raw.githubusercontent.com/fal-ai/serverless-vscode/main/assets/before.png) | ![After](https://raw.githubusercontent.com/fal-ai/serverless-vscode/main/assets/after.png) |
| - Modules not resolved in editor | - Modules resolved automatically |
| - No built-in mechanism to run | - One-click run |


## Requirements

This extension depends on the official [Python extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python). It does not modify the Python behavior but it relies on existing functionality to provide fal-serverless support to Python developers.

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Make sure you read our [Code of Conduct](https://github.com/fal-ai/serverless-vscode/blob/main/CODE_OF_CONDUCT.md)
2. Fork the project and clone your fork
3. Setup the local environment with `npm install`
4. Create a feature branch (`git checkout -b feature/add-cool-thing`) or a bugfix branch (`git checkout -b fix/smash-that-bug`)
5. Commit the changes (`git commit -m 'feat: added a cool thing'`) - use [conventional commits](https://conventionalcommits.org)
6. Push to the branch (`git push --set-upstream origin feature/add-cool-thing`)
7. Open a Pull Request

Check the [good first issue queue](https://github.com/fal-ai/serverless-vscode/labels/good+first+issue), your contribution will be welcome!

## License

Distributed under the MIT License. See [LICENSE](https://github.com/fal-ai/serverless-vscode/blob/main/LICENSE) for more information.
