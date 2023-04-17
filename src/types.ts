export interface IsolateFunctionMetadata {
  line: LineReference;
  file: string;
  name: string;
  isolate_node: IsolateDecoratorMetadata;
}

export interface IsolateDecoratorMetadata {
  line: LineReference;
  params: IsolateDecoratorParams;
}

export interface LineReference {
  start_line: number;
  start_col: number;
  end_line: number;
  end_col: number;
}

export interface IsolateDecoratorParams {
  machine_type: null | string;
  requirements: string[];
}
