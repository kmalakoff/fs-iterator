export = FSIterator;
declare function FSIterator(root: any, options: any): FSIterator;
declare class FSIterator {
    constructor(root: any, options: any);
    root: string;
    stack: PathStack;
}
declare namespace FSIterator {
    let EXPECTED_ERRORS: string[];
}
import PathStack = require("./PathStack");
