<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;

/**
 * Class RepositoryServiceProvider
 * @package App\Providers
 * @author Anderson Andrade <contato@andersonandra.de>
 */
class RepositoryServiceProvider extends ServiceProvider
{

    /**
     * Indicates if loading of the provider is deferred.
     *
     * @var bool
     */
    protected $defer = false;


    /**
     *
     * @return void
     */
    public function boot()
    {
    }


    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {
        $this->commands('App\Generators\Commands\RepositoryCommand');
        $this->commands('App\Generators\Commands\TransformerCommand');
        $this->commands('App\Generators\Commands\PresenterCommand');
        $this->commands('App\Generators\Commands\EntityCommand');
        $this->commands('App\Generators\Commands\ValidatorCommand');
        $this->commands('App\Generators\Commands\ControllerCommand');
        $this->commands('App\Generators\Commands\BindingsCommand');
        $this->commands('App\Generators\Commands\CriteriaCommand');
        $this->app->register('App\Providers\EventServiceProvider');
    }


    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides()
    {
        return [];
    }
}
