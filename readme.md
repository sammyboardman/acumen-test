### Description
This is an express app that is used to manage student enrollments for courses,
it can 
- create user
- activate user account
- login a user
- list enrollments.
- add a new enrollment. 
- delete an existing student enrollment.

#### Postman
- https://www.getpostman.com/collections/15e1c4a2443e0bb9a39d

#### Docker Hub
- https://hub.docker.com/r/boardmandocker/acumen-students

The application uses [express](https://expressjs.com/ "expressjs's Website") ,
 [firestore](https://firebase.google.com/docs/firestore "firestore's Website") 
 and [docker](https://www.docker.com/ "Dockers's Website") .

#### Running the App
Once the contents of this repository is pulled , one should set the environment variables in the `env.sample` file ,then run the app using `npm run dev`.
If you will be running with docker, you can build the image  and run the container making sure an environment file is supplied to the docker daemon,
you can also attach your own service config file and specify the name in the env  variable like `docker run --env-file ./env.sample ${imageName}`.


#### Testing

The application has some light unit tests that can be run 
using `npm run test` or by running `mocha` if you have [Mocha](https://mochajs.org/ "Mocha's Website")  installed on your computer.

#### Improvements 
The app can be improved by 
- adding more tests
- making the list enrollment API accept parameters like limit and offset for pagination.

Thank you for looking through.

