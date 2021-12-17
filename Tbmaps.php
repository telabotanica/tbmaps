<?php

class Tbmaps
{
	const TPL_NAME = 'tbmaps';
	const RUN_PREFIX = 'run';
	const DEFAULT_WEBSITE_URL = 'https://www.tela-botanica.org';
	const DEFAULT_LOGO_URL = 'https://resources.tela-botanica.org/tb/img/128x128/logo_carre_officiel.png';

	protected $params = null;
	protected $messages = [];
	protected $debug = [];

	private $requested   = null;
	private $titre   = null;
	private $logo    = null;
	private $website_url = null;

	public function __construct($params) {
		$this->params = $params;
	}

	/**
	 * Method called by default to run this application
	 */
	public function run() {
		$ret = null;
		// For the creation of the cash id we do not take into account the parameter of the callback url
		unset($this->params['callback']);
		// Retrieve the url parameters
		$this->extractParams();
		// Check the availability of requested services and resources
		$method = self::RUN_PREFIX.ucfirst($this->requested);
		if (method_exists($this, $method)) {
			$ret = $this->$method();
		} else {
			$this->messages[] = "Ce type de service '$method' n'est pas disponible.";
		}

		if (is_null($ret)) {
			$info = 'Un problème est survenu : '.print_r($this->messages, true);
			$this->send($info);
		} else {
			$template = dirname(__FILE__).DIRECTORY_SEPARATOR.'templates'.DIRECTORY_SEPARATOR.$ret['template'].'.tpl.html';
			$html = $this->renderTemplate($template, $ret['data']);
			$this->send($html);
		}
	}

	protected function send($data = null, $mime = 'text/html', $encoding = 'utf-8') {
		// Processing of error messages and data
		if (count($this->messages) != 0) {
			header('HTTP/1.1 500 Internal Server Error');
			$mime = 'text/html';
			$encoding = 'utf-8';
			$output = '<html>'.
				'<head><title>Messages</title></head>'.
				'<body><pre>'.implode("\n", $this->messages).'</pre><body>'.
				'</html>';
		} else {
			$output = $data;
			if (is_null($data)) {
				$output = 'OK';
			}
		}

		// Debugging Management
		$this->sendDebugging();

		// Send to standard output
		$this->sendContent($encoding, $mime, $output);
	}

	private function sendDebugging() {
		if (!is_array($this->debug)) {
			$this->debug[] = $this->debug;
		}
		if (count($this->debug) != 0) {
			foreach ($this->debug as $key => $val) {
				if (is_array($val)) {
					$this->debug[$key] = print_r($val, true);
				}
			}
			header('X-DebugJrest-Data:'.json_encode($this->debug));
		}
	}

	private function sendContent($encoding, $mime, $content) {
		if (!is_null($mime) && !is_null($encoding)) {
			header("Content-Type: $mime; charset=$encoding");
		} else if (!is_null($mime) && is_null($encoding)) {
			header("Content-Type: $mime");
		}
		print_r($content);
	}

	/**
	 * Method taking a template file path as parameter and an associative array of data,
	 * extracts the variables, loads the template and returns the result of the two combined.
	 *
	 * @param String $file	path of template file
	 * @param Array  $data	an associative array containing the variables to be injected into the template
	 *
	 * @return boolean false if the template does not exist, otherwise the result string
	 */
	protected static function renderTemplate($file, Array $data = []) {
		$output = false;
		if (file_exists($file)) {
			// Extracting variables from the data table
			extract($data);
			// Starting output buffering
			ob_start();
			// Otherwise, replacement of short tags by the classic syntax with echo
			$template = file_get_contents($file);
			// To evaluate php mixed in html it is necessary to close the php tag opened by eval
			$template = '?>'.$template;
			// Interpretation of html and php in the buffer
			echo eval($template);
			// Get the contents of the buffer
			$output = ob_get_contents();
			// Deleting the buffer
			@ob_end_clean();
		} else {
			$msg = "Le fichier du squelette '$file' n'existe pas.";
			trigger_error($msg, E_USER_WARNING);
		}
		// Return content
		return $output;
	}


	public function extractParams() {
		extract($this->params);
		$this->requested   = isset($tpl) ? $tpl : self::TPL_NAME;
		$this->logo        = isset($logo) ? $logo : self::DEFAULT_LOGO_URL;
		$this->title       = isset($titre) ? $titre : null;
		$this->website_url = isset($url_site) ? $url_site : self::DEFAULT_WEBSITE_URL;
		$this->zoom        = isset($zoom) ? intval($zoom) : 6;
	}

	/**
	 * Default map
	 */
	public function runTbmaps() {
		$app = null;
		$protocol = (isset($_SERVER['HTTPS']) && ($_SERVER['HTTPS'] == 'on')) ? 'https://' : 'http://';
		$base_url = $protocol . $_SERVER['SERVER_NAME'] . '/tbmaps/';

		// Creation of application informations
		$app['data']['assets']      = $base_url.'assets/';
		$app['data']['templates']   = $base_url.'templates/';
		$app['data']['title']       = $this->title;
		$app['data']['logo']        = $this->logo;
		$app['data']['zoom']        = $this->zoom;
		$app['data']['website_url'] = $this->website_url;

		$app['template'] = 'tbmaps';

		return $app;
	}

}

?>
