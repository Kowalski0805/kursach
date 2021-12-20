import IParser from './IParser';

class RSSParser implements IParser {
    sources: string[];
    updFrequency: number;

    constructor(srcs: string[], updFreq: number) {
        this.sources = srcs;
        this.updFrequency = updFreq;
    }

    update: () => {

    };
}