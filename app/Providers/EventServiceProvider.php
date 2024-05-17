<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;

/**
 * Class EventServiceProvider
 * @package App\Providers
 * @author Anderson Andrade <contato@andersonandra.de>
 */
class EventServiceProvider extends ServiceProvider
{

    /**
     * The event handler mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        'App\Events\RepositoryEntityCreated' => [
            'App\Listeners\CleanCacheRepository'
        ],
        'App\Events\RepositoryEntityUpdated' => [
            'App\Listeners\CleanCacheRepository'
        ],
        'App\Events\RepositoryEntityDeleted' => [
            'App\Listeners\CleanCacheRepository'
        ]
    ];

    /**
     * Register the application's event listeners.
     *
     * @return void
     */
    public function boot()
    {
        $events = app('events');

        foreach ($this->listen as $event => $listeners) {
            foreach ($listeners as $listener) {
                $events->listen($event, $listener);
            }
        }
    }

    /**
     * {@inheritdoc}
     */
    public function register()
    {
        //
    }

    /**
     * Get the events and handlers.
     *
     * @return array
     */
    public function listens()
    {
        return $this->listen;
    }
}
