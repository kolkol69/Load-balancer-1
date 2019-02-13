import Database from "./Database";
import LoadBalancingStrategy from "./LoadBalancingStrategy";
import DNSDelegation from "./DNSDelegation";
import RoundRobinDNS from "./RoundRobinDNS";
import {Query} from "./Query";
import RequestCounting from "./RequestCounting";
import {DatabaseOptions} from "./DatabaseOptions";


export default class LoadBalancer {

    public strategy: LoadBalancingStrategy;
    public databaseCount = 0;
    public activeDatabaseCount = 0;

    private static instance: LoadBalancer;
    public databases: Database[];
    public queryList: Query[];


    private constructor(strategy: string = null) {
        /*
        if(strategy === null && this.strategy)
            return;
        else if(strategy === null && this.strategy === null)
            strategy = 'DNSDelegation';
        */
        
        if(strategy === null) strategy = 'DNSDelegation';
        
        if(strategy === 'DNSDelegation')
            this.strategy = new DNSDelegation();
        else if(strategy === 'RoundRobinDNS')
            this.strategy = new RoundRobinDNS();
        else if(strategy === 'RequestCounting')
            this.strategy = new RequestCounting()
    }

    public static getInstance(strategy: string = null): LoadBalancer {
        //if(!LoadBalancer.instance)
        if(!LoadBalancer.instance || strategy != null)
            LoadBalancer.instance = new LoadBalancer(strategy);

        return LoadBalancer.instance;
    }

    public addDatabase(options: DatabaseOptions): void {
        this.databases.push(new Database(options));
        this.databaseCount++;
    }

    public deleteDatabase(port: string): boolean {
        let filteredDatabases = this.databases.filter(e => e.port !== port);

        if (filteredDatabases === this.databases)
            return false;
        else {
            this.databases = filteredDatabases;
            //this.databases--;
            this.databaseCount--;
            return true;
        }
    }

    public sendQuery(query: string, callback = null, databasePort = null ) {
       this.strategy.sendQuery(query, callback, databasePort)
    }

    static getQueryType(query: string): string {
        query = query.toUpperCase();
        if (query.includes('DELETE') ||
            query.includes('UPDATE') ||
            query.includes('CREATE') ||
            query.includes('DROP') ||
            query.includes('INSERT'))
            return 'modify';
        else
            return 'not-modify';
    }

    setActiveDatabaseCount(){
        this.activeDatabaseCount++;
        this.strategy.notifyAboutActiveDB();
    }


}
