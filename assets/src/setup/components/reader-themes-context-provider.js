/**
 * WordPress dependencies
 */
import { createContext, useEffect, useState, useRef, useContext, useMemo } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { useError } from '../utils/use-error';
import { Options } from './options-context-provider';

export const ReaderThemes = createContext();

/**
 * Context provider for options retrieval and updating.
 *
 * @param {Object} props Component props.
 * @param {string} props.wpAjaxUrl WP AJAX URL.
 * @param {?any} props.children Component children.
 * @param {string} props.readerThemesEndpoint REST endpoint to fetch reader themes.
 * @param {string} props.updatesNonce Nonce for the AJAX request to install a theme.
 */
export function ReaderThemesContextProvider( { wpAjaxUrl, children, readerThemesEndpoint, updatesNonce } ) {
	const [ themes, setThemes ] = useState( null );
	const [ fetchingThemes, setFetchingThemes ] = useState( false );
	const [ downloadingTheme, setDownloadingTheme ] = useState( false );
	const [ downloadedTheme, setDownloadedTheme ] = useState( false );

	/**
	 * Handle downloaded theme errors separately from normal error handling because we don't want it to break the application
	 * after settings have already been saved.
	 */
	const [ downloadingThemeError, setDownloadingThemeError ] = useState( null );

	const { setError } = useError();

	const { editedOptions, savingOptions } = useContext( Options );
	const { reader_theme: readerTheme, theme_support: themeSupport } = editedOptions;

	// This component sets state inside async functions. Use this ref to prevent state updates after unmount.
	const hasUnmounted = useRef( false );

	const selectedTheme = useMemo(
		() => themes ? themes.find( ( { slug } ) => slug === readerTheme ) : null,
		[ readerTheme, themes ],
	);

	/**
	 * Downloads the selected reader theme, if necessary, when options are saved.
	 */
	useEffect( () => {
		if ( ! selectedTheme ) {
			return;
		}

		if ( ! savingOptions || downloadingTheme ) {
			return;
		}

		if ( 'installable' !== selectedTheme.availability ) {
			return;
		}

		/**
		 * Downloads a theme from WordPress.org using the traditional AJAX action.
		 */
		( async () => {
			if ( downloadingTheme || downloadingThemeError ) {
				return;
			}

			setDownloadingTheme( true );

			try {
				const body = new global.FormData();
				body.append( 'action', 'install-theme' );
				body.append( 'slug', selectedTheme.slug );
				body.append( '_wpnonce', updatesNonce );

				// This is the only fetch request in the setup wizard that doesn't go to a REST endpoint.
				// We need to use window.fetch to bypass the apiFetch middlewares that are useful for other requests.
				const response = await global.fetch( wpAjaxUrl, {
					body,
					method: 'POST',
				} );

				if ( true === hasUnmounted.current ) {
					return;
				}

				if ( ! response.ok ) {
					throw new Error( __( 'Reader theme failed to download.', 'amp' ) );
				}

				setDownloadedTheme( selectedTheme.slug );
			} catch ( e ) {
				if ( true === hasUnmounted.current ) {
					return;
				}

				setDownloadingThemeError( e );
			}

			setDownloadingTheme( false );
		} )();
	}, [ wpAjaxUrl, downloadingTheme, downloadingThemeError, savingOptions, selectedTheme, themeSupport, updatesNonce ] );

	/**
	 * Fetches theme data when needed.
	 */
	useEffect( () => {
		if ( fetchingThemes || ! readerThemesEndpoint || themes || 'reader' !== themeSupport ) {
			return;
		}

		/**
		 * Fetch themes from the REST endpoint.
		 */
		( async () => {
			setFetchingThemes( true );

			try {
				const fetchedThemes = await apiFetch( { url: readerThemesEndpoint } );

				if ( hasUnmounted.current === true ) {
					return;
				}

				// Screenshots are required.
				setThemes( fetchedThemes );
			} catch ( e ) {
				setError( e );
				return;
			}

			setFetchingThemes( false );
		} )();
	}, [ fetchingThemes, readerThemesEndpoint, setError, themes, themeSupport ] );

	useEffect( () => () => {
		hasUnmounted.current = true;
	}, [] );

	return (
		<ReaderThemes.Provider
			value={
				{
					downloadedTheme,
					downloadingTheme,
					downloadingThemeError,
					fetchingThemes,
					themes,
				}
			}
		>
			{ children }
		</ReaderThemes.Provider>
	);
}

ReaderThemesContextProvider.propTypes = {
	wpAjaxUrl: PropTypes.string.isRequired,
	children: PropTypes.any,
	readerThemesEndpoint: PropTypes.string.isRequired,
	updatesNonce: PropTypes.string.isRequired,
};
