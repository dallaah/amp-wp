/* eslint-disable jest/no-export */
/* eslint-disable jest/require-top-level-describe */

/**
 * WordPress dependencies
 */
import { visitAdminPage } from '@wordpress/e2e-test-utils';

export const welcome = () => {
	beforeEach( async () => {
		await visitAdminPage( 'admin.php', 'page=amp-setup' );
		await page.waitForSelector( '.amp-setup-nav__prev-next' );
	} );

	test( 'should contain content', async () => {
		await expect( page ).toMatchElement( '.welcome' );
	} );
};

/* eslint-enable jest/require-top-level-describe */
/* eslint-enable jest/no-export */
