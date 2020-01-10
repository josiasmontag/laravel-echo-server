var Redis = require('ioredis');
import { Log } from './../log';
import { Subscriber } from './subscriber';

export class RedisSubscriber implements Subscriber {
    /**
     * Redis pub/sub client.
     *
     * @type {object}
     */
    private _redis: any;

    /**
     *
     * KeyPrefix for used in the redis Connection
     *
     * @type {String}
     */
    private _keyPrefix: string;

    /**
     * Create a new instance of subscriber.
     *
     * @param {any} options
     */
    constructor(private options) {
        this._keyPrefix = options.databaseConfig.redis.keyPrefix || '';
        this._redis = new Redis(options.databaseConfig.redis);
    }

    /**
     * Subscribe to events to broadcast.
     *
     * @return {Promise<any>}
     */
    subscribe(callback): Promise<any> {

        return new Promise((resolve, reject) => {
            this._redis.on('pmessage', (subscribed, channel, message) => {
                try {
                    message = JSON.parse(message);

                    if (this.options.devMode) {
                        Log.info("Channel: " + channel);
                        Log.info("Event: " + message.event);
                    }

                    callback(channel.substring(this._keyPrefix.length), message);
                } catch (e) {
                    if (this.options.devMode) {
                        Log.info("No JSON message");
                    }
                }
            });

            resolve();
        });
    }

    subscribeChannel(channel): Promise<any> {

        return new Promise((resolve, reject) => {

            this._redis.psubscribe(`${this._keyPrefix}${channel}`, (err, count) => {
                if (err) {
                    reject('Redis could not subscribe.')
                }

                if (this.options.devMode) {
                    Log.info(`Listening for redis events in ${channel}...`);
                }

                resolve();
            });
        });

    }

    unsubscribeChannel(channel): Promise<any> {

        return new Promise((resolve, reject) => {

            this._redis.punsubscribe(`${this._keyPrefix}${channel}`, (err, count) => {
                if (err) {
                    reject('Redis could not unsubscribe.')
                }

                if (this.options.devMode) {
                    Log.info(`Stopped listening for redis events in ${channel}...`);
                }

                resolve();
            });
        });

    }

}
