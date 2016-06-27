'use strict';

import Base from './base.js';
import request from 'request';

export default class extends Base {
    /**
     * index action
     * @return {Promise} []
     */
    indexAction() {
        let server = this.model('server').select();
        this.assign('server', server);

        return this.display();
    }

    /**
     * add action
     * @return {Promise} []
     */
    addAction() {
        let data = null;

        if (this.isPost()) {
            data = this.post();
            if (think.isEmpty(this.get('id'))) {
                this.model('server').add(data);
            } else {
                this.model('server').where(this.get()).update(data);
            }

            this.assign('server', '');
        } else {
            data = this.get();
            let server = this.model('server').where(data).find();
            this.assign('server', server);

        }

        return this.display();
    }

    /*
     * del action
     *
     * */
    delAction() {
        let data = this.get();

        let result = this.model('server').where(data).delete();

        this.action('server', 'index');
    }

    async runstatusAction() {
        const _get = this.get();
        let server = await this.model('server').where(_get).find();

        let json = {
            name: server.name,
            ip: server.ip,
            port: server.port
        };

        let url = 'http://' + json.ip + ':' + json.port + '/setuser.asp';

        let resultData = await this.getApiData(url).catch((e)=> {
            return e
        });

        if (resultData.statusCode == 200) {
            this.model('server').where(_get).update({status: 1});
            return this.success(json, this.locale('query_success'));
        } else {
            this.model('server').where(_get).update({status: 0});
            return this.error(5000, this.locale('query_success'), json);
        }
    }

    getApiData(url) {
        let fn = think.promisify(request.get);
        return fn({
            url: url,
        });
    }
}