<?php
$result=new stdClass();
$settings = json_decode(file_get_contents('../files/prefs.json'));
$userbaseFile = '../files/userbase.json';
$userbase = json_decode(file_get_contents($userbaseFile));
if (isset($_POST["id"])) {
    $id = $_POST["id"];
    if (isRegistered($id)) {

    } else {
        createUser();
    }
} else {
    $result->error="Unknown";
}
echo json_encode($result);

function createUser()
{
    global $userbase, $userbaseFile, $result;
    if (isset($_POST["userinfo"])) {
        $userinfo = json_decode($_POST["userinfo"]);
        $id = null;
        while ($id === null) {
            $random = rand(1, 10000);
            if (!isset($userbase->$random)) {
                $id = $random;
            }
        }
        $seed = rand(10000000, 99000000);

        $user = new stdClass();
        $user->id = $id;
        $user->seed = $seed;
        $user->name = $userinfo->name;
        $user->type = $userinfo->type;
        $user->status = "standard";
        $user->meetings = [];

        // Write To Results
        $result->id = $id;
        $result->seed = $seed;
        // Write To Userbase
        $userarray = $userbase->users;
        array_push($userarray, $user);
        $userbase->users = $userarray;
        // Write Userbase
        file_put_contents($userbaseFile, json_encode($userbase));
    }
}

function isRegistered($id)
{
    global $userbase;
    $users = $userbase->users;
    for ($i = 0; $i < sizeof($users); $i++) {
        if ($users[$i]->id === $id) return true;
    }
    return false;

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