<?php

namespace AmpProject\AmpWP\Tests\Unit;

use AmpProject\AmpWP\Icon;
use AmpProject\AmpWP\Tests\AssertContainsCompatibility;
use PHPUnit\Framework\TestCase;

final class IconTest extends TestCase {

	use AssertContainsCompatibility;

	/** @return array */
	public function get_icon_types() {
		return [
			'invalid' => [ 'invalid' ],
			'link'    => [ 'link' ],
			'valid'   => [ 'valid' ],
			'warning' => [ 'warning' ],
			'logo'    => [ 'logo' ],
		];
	}

	/**
	 * @param string $type Icon type.
	 * @dataProvider get_icon_types
	 * @covers Icon::__construct()
	 * @covers Icon::invalid()
	 * @covers Icon::link()
	 * @covers Icon::valid()
	 * @covers Icon::warning()
	 * @covers Icon::logo()
	 * @covers Icon::get_color()
	 * @covers Icon::to_html()
	 */
	public function test_types( $type ) {
		/** @var Icon $icon */
		$icon = Icon::$type();
		$this->assertInstanceOf( Icon::class, $icon );

		$this->assertInternalType( 'string', $icon->get_color() );

		$html = $icon->to_html();
		$this->assertStringStartsWith( '<span ', $html );
		$this->assertStringEndsWith( '</span>', $html );
		$this->assertStringContains( "class=\"amp-icon amp-{$type}\"", $html );

		$html = $icon->to_html(
			[
				'id'      => 'amp-admin-bar-item',
				'class'   => 'ab-icon',
				'data-ok' => '" onclick="alert(\"evil\")">end',
			]
		);
		$this->assertStringContains( "class=\"ab-icon amp-icon amp-{$type}\"", $html );
		$this->assertStringContains( 'id="amp-admin-bar-item"', $html );
		$this->assertStringEndsWith( '</span>', $html );
		$this->assertRegExp( '/data-ok="&quot; onclick=.+[^"]+?end"/', $html );
	}
}