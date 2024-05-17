<?php
namespace App\Events;

/**
 * Class RepositoryEntityCreated
 * @package App\Events
 * @author Anderson Andrade <contato@andersonandra.de>
 */
class RepositoryEntityCreated extends RepositoryEventBase
{
    /**
     * @var string
     */
    protected $action = "created";
}
