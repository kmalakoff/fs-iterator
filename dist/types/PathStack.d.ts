export = PathStack;
declare function PathStack(): void;
declare class PathStack {
    stack: FIFO<any>;
    length: number;
    push(item: any): this;
    pop(): any;
    last(): any;
}
import FIFO = require("fifo");
