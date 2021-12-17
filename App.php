<?php
// In : utf8 url_encoded (get et post)
// Out : utf8
/**
 * App class loads php config and params and loads the application.
 * format of the url :
 * /tbmap/?param1=value1&param2=value2
 *
 *
 * @author Idir Alliche
 *
 */
class App {

	const DEFAULT_APP = 'Tbmaps';

 	// Config params extracted from *.ini file
    private static $config;

	// Clean params from $_GET
	private $params = null;

	/**
	 * Constructor.
	 * Parses configuration file "config.ini" and loads php config and params.
	 * @param str iniFile Configuration file to use
	 */
	public function __construct($ini_file = './config/config.ini.php') {
		if (!isset($_SERVER['REQUEST_URI']) || !isset($_SERVER['QUERY_STRING'])) {
			$e = 'Tela Botanica Maps require the following server variables to function : REQUEST_URI et QUERY_STRING.';
			trigger_error($e, E_USER_ERROR);
		}
		// Configuration loading
		self::$config = parse_ini_file($ini_file, TRUE);

		// Memory management for services
		ini_set('memory_limit', self::$config['params']['memoryLimit']);

		// PHP settings
		setlocale(LC_ALL, self::$config['params']['locale']);
		date_default_timezone_set(self::$config['params']['timeZone']);

		// Errors management
		error_reporting(self::$config['params']['errorLevel']);

		// $_GET cleaning (secure)
		$this->collectParams();
	}

	private function collectParams() {
		if (isset($_GET) && $_GET != '') {
			$this->cleanGet();
			$this->params = $_GET;
		}
	}

	private function cleanGet() {
		foreach ($_GET as $key => $value) {
			$check = ['NULL', "\n", "\r", "\\", '"', "\x00", "\x1a", ';'];
			$_GET[$key] = strip_tags(str_replace($check, '', $value));
		}
	}

	/**
	 * Launches script.
	 */
	function run() {
		$app_name = !empty(self::$config['params']['mapName']) ? self::$config['params']['mapName'] : self::DEFAULT_APP;
		$file = $app_name.'.php';

		if (file_exists($file))  {
			include_once $file;
			if (class_exists($app_name)) {
				$app = new $app_name($this->params);
				$app->run();
			}
		}
	}
}
?>
