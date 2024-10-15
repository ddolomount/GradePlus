<?php

use Tests\Support\AcceptanceTester;

class IndexCest {
    public function checkIndexPage(AcceptanceTester $I) {
        $I->amOnPage('/');
        $I->see('Welcome');
    }
}