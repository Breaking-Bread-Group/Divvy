/**
 * @interface logInput
 * 
 * Helpful for strong typing since I know the input on log functions can be kinda long.
 * This should make it easier to write out.
 * 
 * Just a storage medium this doesn't actually do anything.
 */
export interface logInput {
    tag: string,
    msg: string,
    issuer_id: number | null,
    issuer_state: number,
    ip: string,
    verbosity: number
}
