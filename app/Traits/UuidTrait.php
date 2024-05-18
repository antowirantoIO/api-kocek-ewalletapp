<?php

namespace App\Traits;

use Illuminate\Support\Str;

trait UuidTrait
{
    /**
     * Boot function from Laravel.
     */
    protected static function bootUuids()
    {
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    /**
     * Disable auto-incrementing.
     *
     * @return bool
     */
    public function getIncrementing()
    {
        return false;
    }

    /**
     * Get the data type of the auto-incrementing ID.
     *
     * @return string
     */
    public function getKeyType()
    {
        return 'string';
    }
}
