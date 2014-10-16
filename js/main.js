/**
 * A PhotoModel is the data the describes a photograph
 */
var PhotoModel = (function () {
    /**
     * Constructs a PhotoModel
     * @param category The category this photo belongs to
     * @param path The path of this photo's file
     * @param cache A cache postfix dictionary for sizes.
     */
    function PhotoModel(category, path, cache) {
        this.category = ko.observable(category);
        this.path = ko.observable(PhotoModel.BASE_GALLERY_PATH + path);
        this.smallPath = ko.observable(PhotoModel.BASE_GALLERY_PATH + path + cache['small']);
        this.mediumPath = ko.observable(PhotoModel.BASE_GALLERY_PATH + path + cache['medium']);
    }
    /**
     * Gets the category associated with this PhotoModel
     * @returns {any}
     */
    PhotoModel.prototype.getCategory = function () {
        return this.category();
    };
    /**
     * Handles loading this PhotoModel
     * @param photo The current photoModel
     * @param e The event associated with this load
     */
    PhotoModel.prototype.onLoad = function (photo, e) {
        var loader = $(e.target).siblings('.loader');
        loader.hide();
    };
    PhotoModel.BASE_GALLERY_PATH = 'gallery/';
    return PhotoModel;
})();
/// <reference path="../vendor/knockout.d.ts" />
/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="PhotoModel.ts" />
/**
 * A FotoViewModel is a ViewModel implementation for a simple
 * front end web application for viewing photos organized into categories.
 */
var FotoViewModel = (function () {
    /**
     * Constructs a FotoViewModel given a source listing service location
     * @param listingSource
     */
    function FotoViewModel(listingSource) {
        var _this = this;
        this.sizePostfixes = {
            'medium': '',
            'small': ''
        };
        this.currentPhoto = ko.observable(null);
        this.photos = ko.observableArray([]);
        this.displayPhoto = ko.observable(false);
        this.photoCategoryDictionary = {};
        this.categories = ko.observableArray([]);
        this.currentCategory = ko.observable("");
        // Load the PhotoModels
        this.loadPhotos(listingSource, function (data) {
            _this.onInitialize.call(_this, data);
            _this.displayPhoto(false);
            _this.currentPhoto(null);
        });
    }
    /**
     * Checks whether the 'all' category is the active one.
     * @returns {boolean} true if the 'all' category is active.
     */
    FotoViewModel.prototype.isAllCategoryActive = function () {
        return this.currentCategory() == FotoViewModel.CATEGORY_ALL;
    };
    /**
     * Checks whether the given category is the active one.
     * @param category The category to check
     * @returns {boolean} true if the given category is active.
     */
    FotoViewModel.prototype.isActiveCategory = function (category) {
        return this.currentCategory() == category;
    };
    /**
     * Gets the current collection of photos to display as an Observable Array.
     * @returns {KnockoutObservableArray<PhotoModel>} The current viewable collection of PhotoModels
     */
    FotoViewModel.prototype.getCurrentCategoryPhotos = function () {
        if (this.currentCategory() == FotoViewModel.CATEGORY_ALL) {
            return this.photos;
        }
        else {
            return this.photoCategoryDictionary[this.currentCategory()];
        }
    };
    /**
     * Sets the current displayed photo
     * @param photo The photo model to display
     */
    FotoViewModel.prototype.setCurrentPhoto = function (photo) {
        this.currentPhoto(photo);
    };
    /**
     * Sets whether or not to display the current display photo
     * @param value True to display it, false otherwise.
     */
    FotoViewModel.prototype.setDisplayPhoto = function (value) {
        this.displayPhoto(value);
    };
    /**
     * Handles clicking a photo thumbnail
     * @param viewModel the current view model
     * @param photo the PhotoModel clicked.
     */
    FotoViewModel.prototype.onClickPhoto = function (viewModel, photo) {
        viewModel.setCurrentPhoto.call(viewModel, photo);
        viewModel.setDisplayPhoto.call(viewModel, true);
    };
    /**
     * Called when a user clicks a category of photos
     * @param category
     */
    FotoViewModel.prototype.onClickCategory = function (category) {
        this.setCategory(category);
        this.displayPhoto(false);
    };
    /**
     * Called when a user clicks a category of photos
     * @param category
     */
    FotoViewModel.prototype.onClickViewAll = function () {
        this.setCategory(FotoViewModel.CATEGORY_ALL);
    };
    /**
     * Sets the current category to the given category.
     * If no photographs are in the given category, nothing will happen.
     * @param category The given category to change to.
     */
    FotoViewModel.prototype.setCategory = function (category) {
        this.currentCategory(category);
    };
    /**
     * Called when the user indicates they want to close the preview window.
     */
    FotoViewModel.prototype.onCloseDisplay = function () {
        this.displayPhoto(false);
        var loader = $('.content').children('.loader');
        loader.show();
    };
    /**
     * Initializes the view model given constructed PhotoModel objects.
     * @param photoModels The PhotoModels to initialize with.
     */
    FotoViewModel.prototype.onInitialize = function (photoModels) {
        for (var i = 0; i < photoModels.length; i++) {
            var model = photoModels[i];
            var category = model.getCategory();
            if (!this.photoCategoryDictionary.hasOwnProperty(category)) {
                this.photoCategoryDictionary[category] = ko.observableArray([]);
                this.categories.push(category);
            }
            // Add to category collection
            this.photoCategoryDictionary[category].push(model);
            // Add to "all-photos" collection
            this.photos.push(model);
        }
        this.setCategory(FotoViewModel.CATEGORY_ALL);
    };
    /**
     * Loads photographs from a source and returns a list
     * of result PhotoModel through the given callback
     * @param source The source URL to request photo information from
     * @param callback The function that will receive the PhotoModel objects.
     */
    FotoViewModel.prototype.loadPhotos = function (source, callback) {
        $.get(source, function (data) {
            // Load photo models
            var photographs = [];
            for (var i = 0; i < data.photos.length; i++) {
                photographs.push(new PhotoModel(data.photos[i].category, data.photos[i].path, data.cache));
            }
            callback(photographs);
        });
    };
    FotoViewModel.CATEGORY_ALL = ':ALL:';
    return FotoViewModel;
})();
/// <reference path="vendor/knockout.d.ts" />
/// <reference path="app/PhotoModel.ts" />
/// <reference path="app/FotoViewModel.ts" />
var vm = new FotoViewModel("gallery/serve.php");
ko.applyBindings(vm);
//# sourceMappingURL=main.js.map