<?php

declare(strict_types=1);

namespace Akeneo\Pim\Enrichment\Component\Product\Completeness\Model;

/**
 * @author Pierre Allard <pierre.allard@akeneo.com>
 */
class CompletenessFamilyMaskPerChannelAndLocale
{
    /** @var string */
    private $channelCode;

    /** @var string */
    private $localeCode;

    /**
     * ['name-ecommerce-en_US', 'sku-<all_channel>-<all_locales>', ...]
     *
     * @var string[]
     */
    private $mask;

    public function __construct(string $channelCode, string $localeCode, array $mask)
    {
        $this->channelCode = $channelCode;
        $this->localeCode = $localeCode;
        $this->mask = $mask;
    }

    public function channelCode(): string
    {
        return $this->channelCode;
    }

    public function localeCode(): string
    {
        return $this->localeCode;
    }

    public function mask(): array
    {
        return $this->mask;
    }
}
