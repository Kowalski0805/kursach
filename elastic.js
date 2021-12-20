'use strict';

const { Client } = require('@elastic/elasticsearch');

class Elastic {
    client;
    index;

    constructor(url, index) {
        this.client = new Client({node: url});
        this.index = index;
    }

    add(data) {
        return this.client.index({index: this.index, body: data});
    }

    refresh() {
        return this.client.indices.refresh({index: this.index});
    }
        
    async get(filter) {
        const { body } = await this.client.search({
            index: this.index,
            body: {
                query: filter
            },
        });
    
        return body;
    }
}

module.exports = Elastic;