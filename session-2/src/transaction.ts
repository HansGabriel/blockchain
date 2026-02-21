export class Transaction {
  constructor(
    public payer: string, // Public key of sender
    public payee: string, // Public key of receiver
    public amount: number
  ) {}
  toString(): string {
    return JSON.stringify(this);
  }
}
