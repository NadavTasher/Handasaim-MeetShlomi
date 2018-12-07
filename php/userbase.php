<?php
$result = new ArrayObject();
$settings = json_decode(file_get_contents('../files/prefs.json'));
$userbase = json_decode(file_get_contents('../files/userbase.json'));
if (isset($_POST["id"])) {
    $id = $_POST["id"];
    if (isRegistered($id)) {

    } else {
        createUser();
    }
} else {
    echo "{\"error\":\"Unknown\"}";
}
echo json_encode($result);

function createUser()
{
    global $userbase, $result;
    $id = null;
    while ($id === null) {
        $random = rand(0, 10000);
        if (!isset($userbase->$random)) {
            $id = $random;
        }
    }
    $seed=rand(10000000,99000000);
    $result->id = $id;
    $result->seed = $seed;

}

function isRegistered($id)
{
    global $userbase;
    if ($id !== 0) {
        return isset($userbase->$id);
    } else {
        return false;
    }
}

function register()
{
    global $settings;
    $file = '../files/schedule.json';
    $json = json_decode(file_get_contents($file));
    $key = $_POST["time"];
    $value = $_POST["name"];
    if (!isset($json->$key)) {
        if ($key >= $settings->settings->time->start && $key <= $settings->settings->time->end && $key % ($settings->settings->time->interval) == 0) {
            if ($settings->settings->allowDuplicates === true) {
                $json->$key = $value;
                echo "Registered!";
            } else {
                $found = false;
                for ($i = $settings->settings->time->start; $i <= $settings->settings->time->end && !$found; $i += $settings->settings->time->interval) {
                    if (isset($json->$i) && $json->$i === $value) {
                        $found = true;
                    }
                }
                if (!$found) {
                    $json->$key = $value;
                    echo "Registered!";
                } else {
                    echo "Already Registered!";
                }
            }
        } else {
            echo "Invalid Time!";
        }
    } else {
        echo "Time Already Taken.";
    }
    file_put_contents($file, json_encode($json));
}