<?php namespace App\Transformer;

use League\Fractal\TransformerAbstract;
use App\Contracts\Transformable;

/**
 * Class ModelTransformer
 * @package App\Transformer
 * @author Anderson Andrade <contato@andersonandra.de>
 */
class ModelTransformer extends TransformerAbstract
{
    public function transform(Transformable $model)
    {
        return $model->transform();
    }
}
