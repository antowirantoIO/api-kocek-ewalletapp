<?php
namespace App\Events;

/**
 * Class RepositoryEntityDeleted
 * @package App\Events
 * @author Anderson Andrade <contato@andersonandra.de>
 */
class RepositoryEntityDeleting extends RepositoryEventBase
{
    /**
     * @var string
     */
    protected $action = "deleting";
}
