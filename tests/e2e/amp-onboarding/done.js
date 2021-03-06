/* eslint-disable jest/no-export */
/* eslint-disable jest/require-top-level-describe */

/**
 * Internal dependencies
 */
import { moveToDoneScreen } from './utils';

export const done = () => {
	test( 'renders standard mode done screen', async () => {
		await moveToDoneScreen( { mode: 'standard' } );

		expect( page ).toMatchElement( 'h1', { text: 'Your site is ready' } );
		expect( page ).toMatchElement( '.phone iframe' );
	} );

	test( 'renders transitional mode done screen', async () => {
		await moveToDoneScreen( { mode: 'transitional' } );

		expect( page ).toMatchElement( 'h1', { text: 'Congratulations!' } );
		expect( page ).toMatchElement( '.phone iframe' );
	} );

	test( 'renders reader mode done screen', async () => {
		await moveToDoneScreen( { mode: 'reader' } );

		expect( page ).toMatchElement( 'h1', { text: 'Congratulations!' } );
		expect( page ).toMatchElement( '.phone iframe' );
	} );
};

/* eslint-enable jest/require-top-level-describe */
/* eslint-enable jest/no-export */
