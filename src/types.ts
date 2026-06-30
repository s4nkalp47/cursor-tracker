export type ClientMessage = { type : 'cursor' ; x: number ; y: number};

export type ServerMessage =
    | { type: 'init' ; id: string ; color: string}
    | {type: 'cursor' ; id: string ; x: number ; y: number ; color: string}
    | {type: 'leave' ; id: string}; 