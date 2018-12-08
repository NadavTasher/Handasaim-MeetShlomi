<?php
// Init Vars
$result = new stdClass();
$settings = json_decode(file_get_contents('../files/settings.json'));
$msprefs = json_decode(file_get_contents('../../files/settings.json'));
$dbFile = '../../files/database.json';
$db = json_decode(file_get_contents($dbFile));
// Main
main();
// Functions
function main()
{
    global $result, $msprefs;
    if (isset($_POST["key"])) {
        // User Actions
        $key = $_POST["key"];
        $auth = checkKey($key);
        $result->auth = $auth;
        if ($auth) {
            if (isset($_POST["action"])) {
                $action = $_POST["action"];
                if ($action === "get") {
                    if (isset($_POST["get"])) {
                        $get = $_POST["get"];
                        if ($get === "pending" || $get === "approved" || $get === "denied") {
                            $result->results = byState($get);
                        } else if ($get === "date") {
                            if (isset($_POST["date"])) {
                                $date = json_decode($_POST["date"]);
                                $result->results = byDate($date);
                            }
                        }
                    }
                    if (!isset($result->results)) {
                        $result->results = array();
                    }
                    $result->slot = $msprefs->slot;
                } else if ($action === "set") {

                } else {
                    $result->error = "Unknown Action";
                }
            }
        }
    } else {
        $result->error = "No Key";
    }
    echo json_encode($result);
}

function byState($get)
{
    global $db;
    $result = array();
    $meetings = $db->meetings;
    for ($m = 0; $m < sizeof($meetings); $m++) {
        if ($meetings[$m]->state === $get) array_push($result, $meetings[$m]);
    }
    return $result;
}

function byDate($date)
{
    global $db;
    $result = array();

    return $result;
}

function checkKey($key)
{
    global $settings;
    return $key === $settings->password;
}

function save()
{
    global $db, $dbFile;
    file_put_contents($dbFile, json_encode($db));
}