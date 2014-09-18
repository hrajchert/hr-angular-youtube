var gulp      = require('gulp'),
    concat    = require('gulp-concat'),
    prefix    = require('gulp-autoprefixer'),
    uglify    = require('gulp-uglify'),
    minifycss = require('gulp-minify-css'),
    rimraf    = require('gulp-rimraf'),
    rename    = require('gulp-rename'),
    html2js   = require('gulp-ng-html2js'),
    replace   = require('gulp-replace');

var fs = require('fs'),
    when = require('when');

var optionsPromise = null;

function loadOptions() {
    if (optionsPromise === null) {
        optionsPromise = when.promise(function(resolve,reject) {
            fs.readFile('.env', function(err, file) {
                if (err) {
                    return reject(err);
                }
                var options = JSON.parse(file);
                // TESTING!
                options.updateBower = true;
                // TODO: maybe fail if no dir is available?
                resolve(options);
            });
        });
    }
    return optionsPromise;
}

gulp.task('process-scripts', function() {
    return gulp.src('./src/**/*.js')
        .pipe(concat('hr-angular-youtube.js'))
        .pipe(gulp.dest('./dist/'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/'));

});

gulp.task('process-templates', function() {
    return gulp.src('template/**/*.html')
        .pipe(html2js({
            moduleName: 'hrAngularYoutubeTpls',
            prefix :'/template/'
        }))
        .pipe(concat('templates.js'))
        .pipe(gulp.dest('./dist/'));
});
//gulp.task('process-scripts-with-tpl',['process-templates'], function() {
gulp.task('process-scripts-with-tpl',['process-templates','process-scripts'], function() {
    //
    return gulp.src(['./dist/templates.js','./dist/hr-angular-youtube.js'])
        .pipe(concat('hr-angular-youtube-tpl.js'))
        .pipe(replace('/*--MODULE-DEPENDENCIES--*/','\'hrAngularYoutubeTpls\''))
        .pipe(gulp.dest('./dist/'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/'));
});


gulp.task('process-styles', function() {
    return gulp.src('./assets/**/*.css')
        .pipe(concat('hr-angular-youtube.css'))
        .pipe(prefix('last 2 version'))
        .pipe(gulp.dest('./dist'))
        .pipe(minifycss())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('demo-cp', function(cb) {
    loadOptions().then(function(options) {
        gulp.src('./demo/**/*').
            pipe(gulp.dest(options.pagesDir + '/demo')).
            on('end', cb);
    }, function() {
        console.error('could not load options file');
    });

});

gulp.task('docs-dist-cp',['process-scripts-with-tpl', 'process-styles'], function(cb) {
    loadOptions().then(function(options) {
        console.log('about to copy docs-dist-cp');
        gulp.src('./dist/**/*').
            pipe(gulp.dest(options.pagesDir + '/dist')).
            on('end', cb);
    });

});


gulp.task('docs-mddoc', function(cb) {
    loadOptions().then(function(options) {
        var mddoc  = require('mddoc'),
            config = mddoc.config;

        // Load the project settings
        var mddocSettings = config.loadConfig(process.cwd(), {outputDir: options.pagesDir});

        // Run the tool
        mddocSettings.done(function(settings) {
            mddoc.verbose(true);
            mddoc.initialize(settings);

            var steps = [
                mddoc.readMarkdown,
                mddoc.readCode,
                mddoc.saveMetadata,
                mddoc.replaceReferences,
                mddoc.generateOutput
            ];

            mddoc.run(steps).then(function () {
                cb();
            }, function(err) {
                console.error('There was an error running the tool ' + JSON.stringify(err));
                cb(false);
            });
        }, function (err) {
            console.error('Coundn\'t read the settings '+ JSON.stringify(err));
            cb(false);
        });
    });
});

gulp.task('docs-clean', function(cb) {
    loadOptions().then(function(options) {
        gulp.src(options.pagesDir + '/**/*.*', { read: false })
        .pipe(rimraf({force:true}))
        // For some reason I need to add a dest, or no end is triggered
        .pipe(gulp.dest(options.pagesDir))
        .on('end', cb);
    });
});

gulp.task('build-docs', ['demo-cp', 'docs-dist-cp', 'docs-mddoc']);

// docs-clean removes git
//gu-lp.task('docs',['docs-clean'], function(){
gulp.task('docs', function(){
    return gulp.start('build-docs');
});

gulp.task('aaa', function() {
    console.log('SUPER AAAA');
    return gulp.start(['process-scripts-with-tpl','docs']);
});
gulp.task('watch', function() {
    // This should be process script, but for some reason is not updating :(
    //    gulp.watch('./src/**/*.js', ['process-scripts']);
    gulp.watch('./src/**/*.js', ['docs']);
//    gulp.watch('./src/**/*.js', ['aaa']);

    gulp.watch('./assets/**/*.css', ['process-styles']);
    gulp.watch('./demo/**/*', ['docs']);
    gulp.watch(['./docs/**/*', '!./docs/custom-generator/bower_components/**'], ['docs']);
});


gulp.task('default', ['process-scripts-with-tpl', 'process-styles', 'docs','watch']);
