'use strict';

const { Client } = require('@elastic/elasticsearch');

export default class Elastic {
    client;
    index;

    constructor(url, index) {
        this.client = new Client({node: url});
        this.index = index;
    }

    add(data) {
        return client.index({index, body: data});
    }

    refresh() {
        return client.indices.refresh({index});
    }
        
    async get(filter) {
        const { body } = await client.search({
            index,
            body: {
                query: filter
            },
        });
    
        return body;
    }
}

module.exports = Elastic;