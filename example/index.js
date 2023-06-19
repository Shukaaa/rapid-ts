import { getRapidObjectClass, RapidServer } from '@rapid-api/rapid-ts';

// Define the rapid objects based on your configuration
const rapid_objects = {
    student: getRapidObjectClass({
        id: 0,
        name: "John Doe",
        age: 20,
        isMale: true,
        subjects: ["Math", "Science", "History"]
    })
};

// Create a new instance of the RapidServer with the configuration file and rapid objects
const rapid_server = new RapidServer("./config.rapid.json", rapid_objects);

// Start the server
rapid_server.start();