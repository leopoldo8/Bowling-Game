export default interface Pins extends Array<{
    el: HTMLElement | null,
    start: number,
    end: number,
    val: number,
    [key: number]: any,
}> {}
