export interface Subscriber {
    /**
     * Subscribe to incoming events.
     *
     * @param  {Function} callback
     * @return {void}
     */
    subscribe(callback: Function): Promise<any>;

    subscribeChannel(channel): Promise<any>;

    unsubscribeChannel(channel): Promise<any>;

}
