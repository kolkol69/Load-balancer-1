export default interface Query{
    query: string
    type: string;
    databasePort?: string;
    callback?: any;
}