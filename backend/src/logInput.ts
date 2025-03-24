export interface logInput {
    tag : string,
    msg : string,
    issuer_id : number | null,
    issuer_state : number,
    ip : string,
    verbosity : number
}
