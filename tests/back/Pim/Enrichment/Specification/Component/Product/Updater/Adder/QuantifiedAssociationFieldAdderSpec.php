<?php

namespace Specification\Akeneo\Pim\Enrichment\Component\Product\Updater\Adder;

use Akeneo\Pim\Enrichment\Component\Product\Model\EntityWithQuantifiedAssociationsInterface;
use Akeneo\Pim\Enrichment\Component\Product\Model\QuantifiedAssociation\QuantifiedAssociations;
use Akeneo\Pim\Enrichment\Component\Product\Updater\Adder\AdderInterface;
use Akeneo\Pim\Enrichment\Component\Product\Updater\Adder\FieldAdderInterface;
use PhpSpec\ObjectBehavior;

class QuantifiedAssociationFieldAdderSpec extends ObjectBehavior
{
    function let()
    {
        $this->beConstructedWith(['quantified_associations']);
    }

    function it_is_an_adder()
    {
        $this->shouldImplement(AdderInterface::class);
        $this->shouldImplement(FieldAdderInterface::class);
    }

    function it_supports_quantified_associations_field()
    {
        $this->supportsField('quantified_associations')->shouldReturn(true);
        $this->supportsField('associations')->shouldReturn(false);
    }

    function it_merge_quantified_associations(
        EntityWithQuantifiedAssociationsInterface $entityWithQuantifiedAssociations,
        QuantifiedAssociations $currentQuantifiedAssociations,
        QuantifiedAssociations $quantifiedAssociationsMerged
    ) {
        $dataToAdd = [
            'PRODUCT_SET' => [
                'products' => [
                    ['identifier' => 'productA', 'quantity' => 8]
                ],
            ],
            'ANOTHER_PRODUCT_SET' => [
                'product_models' => [
                    ['identifier' => 'productModelA', 'quantity' => 9],
                ],
            ],
        ];

        $quantifiedAssociationToAdd = QuantifiedAssociations::createFromNormalized([
            'PRODUCT_SET' => [
                'products' => [
                    ['identifier' => 'productA', 'quantity' => 8]
                ],
            ],
            'ANOTHER_PRODUCT_SET' => [
                'product_models' => [
                    ['identifier' => 'productModelA', 'quantity' => 9],
                ],
            ],
        ]);

        $entityWithQuantifiedAssociations->getQuantifiedAssociations()->willReturn($currentQuantifiedAssociations);
        $entityWithQuantifiedAssociations->setQuantifiedAssociations($quantifiedAssociationsMerged)->shouldBeCalled();
        $currentQuantifiedAssociations
            ->merge($quantifiedAssociationToAdd)
            ->shouldBeCalled()
            ->willReturn($quantifiedAssociationsMerged);

        $this->addFieldData($entityWithQuantifiedAssociations, 'quantified_associations', $dataToAdd);
    }
}
