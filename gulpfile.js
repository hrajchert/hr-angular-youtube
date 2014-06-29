var gulp = require('gulp'),
    concat = require('gulp-concat'),
    prefix = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename');

gulp.task('process-scripts', function() {
    gulp.src('./src/**/*.js')
        .pipe(concat('hr-angular-youtube.js'))
        .pipe(gulp.dest('./dist/'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/'));

});

gulp.task('process-styles', function() {
    gulp.src('./assets/**/*.css')
        .pipe(concat('hr-angular-youtube.css'))
        .pipe(prefix('last 2 version'))
        .pipe(gulp.dest('./dist'))
        .pipe(minifycss())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('watch', function() {
    gulp.watch('./src/**/*.js', ['process-scripts']);
    gulp.watch('./assets/**/*.js', ['process-styles']);
});

gulp.task('default', ['process-scripts', 'process-styles', 'watch']);
