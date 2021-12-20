export default interface IParser {
    sources: string[],
    updFrequency: number,
    update: () => any,
}