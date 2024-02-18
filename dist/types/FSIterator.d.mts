declare class FSIterator {
    constructor(root: any, options: any);
    root: string;
    stack: PathStack;
}
declare namespace FSIterator {
    let EXPECTED_ERRORS: string[];
}
export default FSIterator;
import PathStack from './PathStack.mjs';
