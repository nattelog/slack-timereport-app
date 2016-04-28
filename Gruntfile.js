module.exports = function(grunt) {
  grunt.initConfig({
    /*concurrent: {
      dev: {
	tasks: ['nodemon:dev', 'watch:dev'],
	options: {
	  logConcurrentOutput: true
	}
      }
    },*/
    
    jshint: {
      all: ['index.js', 'test.js', 'lib/*.js']
    },

    nodeunit: {
      all: ['test.js'],
      options: {
	reporter: 'default'
      }
    },

    watch: {
      dev: {
	files: ['index.js', 'test.js', 'lib/*.js'],
	tasks: ['express:dev', 'jshint', 'nodeunit', 'express:dev:stop'],
	options: {
	  spawn: true,
	  atBegin: true
	}
      }
    },

    /*nodemon: {
      dev: {
	script: 'bin/www',
	options: {
	  ignore: ['test.js', 'Gruntfile.js', 'lib/**']
	}
      }
      }*/

    express: {
      dev: {
	options: {
	  script: 'bin/www'
	}
      }
    }
  });

  require('grunt-task-loader')(grunt);
  grunt.loadNpmTasks('grunt-express-server');

  grunt.registerTask('dev', ['watch']);
};
