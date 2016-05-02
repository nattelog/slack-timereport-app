module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: ['index.js', 'test/*.js', 'lib/*.js']
    },

    nodeunit: {
      all: ['test'],
      options: {
	reporter: 'default'
      }
    },

    watch: {
      options: {
	atBegin: true
      },
      dev: {
	files: ['index.js', 'test/*.js', 'lib/*.js'],
	tasks: ['express:dev', 'jshint', 'nodeunit', 'express:dev:stop']
      },
      prod: {
	files: ['index.js', 'lib/*.js'],
	tasks: ['express:prod'],
	options: {
	  spawn: false
	}
      }
    },

    express: {
      dev: {
	options: {
	  script: 'bin/www',
	  port: 3001
	}
      },
      prod: {
	options: {
	  script: 'bin/www',
	  port: 3000
	}
      }
    }
  });

  require('grunt-task-loader')(grunt);
  grunt.loadNpmTasks('grunt-express-server');

  grunt.registerTask('dev', ['watch:dev']);
  grunt.registerTask('prod', ['watch:prod']);
};
