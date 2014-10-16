/// <reference path="../vendor/knockout.d.ts" />
/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="PhotoModel.ts" />
/**
 * A FotoViewModel is a ViewModel implementation for a simple
 * front end web application for viewing photos organized into categories.
 */
class FotoViewModel {
    public static CATEGORY_ALL : string = ':ALL:';

    private currentPhoto : KnockoutObservable<PhotoModel>;
    private sizePostfixes : {[id : string] : string};
    private displayPhoto : KnockoutObservable<boolean>;
    private currentCategory : KnockoutObservable<string>;
    private categories : KnockoutObservableArray<string>;
    private photos : KnockoutObservableArray<PhotoModel>;
    private photoCategoryDictionary : {[id : string] : KnockoutObservableArray<PhotoModel>};

    /**
     * Constructs a FotoViewModel given a source listing service location
     * @param listingSource
     */
    constructor(listingSource : string) {
        this.sizePostfixes = {
          'medium' : '',
          'small' : ''
        };
        this.currentPhoto = ko.observable<PhotoModel>(null);
        this.photos = ko.observableArray<PhotoModel>([]);
        this.displayPhoto = ko.observable<boolean>(false);
        this.photoCategoryDictionary = {};
        this.categories = ko.observableArray<string>([]);
        this.currentCategory = ko.observable<string>("");

        // Load the PhotoModels
        this.loadPhotos(listingSource, (data) => {
            this.onInitialize.call(this, data);
            this.displayPhoto(false);
            this.currentPhoto(null);
        });
    }

    /**
     * Checks whether the 'all' category is the active one.
     * @returns {boolean} true if the 'all' category is active.
     */
    private isAllCategoryActive() : boolean {
        return this.currentCategory() == FotoViewModel.CATEGORY_ALL;
    }

    /**
     * Checks whether the given category is the active one.
     * @param category The category to check
     * @returns {boolean} true if the given category is active.
     */
    private isActiveCategory(category : string) : boolean {
        return this.currentCategory() == category;
    }

    /**
     * Gets the current collection of photos to display as an Observable Array.
     * @returns {KnockoutObservableArray<PhotoModel>} The current viewable collection of PhotoModels
     */
    private getCurrentCategoryPhotos() : KnockoutObservableArray<PhotoModel> {
        if (this.currentCategory() == FotoViewModel.CATEGORY_ALL) {
            return this.photos;
        } else {
            return this.photoCategoryDictionary[this.currentCategory()];
        }
    }

    /**
     * Sets the current displayed photo
     * @param photo The photo model to display
     */
    private setCurrentPhoto(photo) {
        this.currentPhoto(photo);
    }

    /**
     * Sets whether or not to display the current display photo
     * @param value True to display it, false otherwise.
     */
    private setDisplayPhoto(value : boolean) {
        this.displayPhoto(value);
    }

    /**
     * Handles clicking a photo thumbnail
     * @param viewModel the current view model
     * @param photo the PhotoModel clicked.
     */
    private onClickPhoto(viewModel, photo) {
        viewModel.setCurrentPhoto.call(viewModel, photo);
        viewModel.setDisplayPhoto.call(viewModel, true);
    }

    /**
     * Called when a user clicks a category of photos
     * @param category
     */
    private onClickCategory(category : string) {
        this.setCategory(category);
        this.displayPhoto(false);
    }

    /**
     * Called when a user clicks a category of photos
     * @param category
     */
    private onClickViewAll() {
        this.setCategory(FotoViewModel.CATEGORY_ALL);
    }

    /**
     * Sets the current category to the given category.
     * If no photographs are in the given category, nothing will happen.
     * @param category The given category to change to.
     */
    private setCategory(category : string) {
        this.currentCategory(category);
    }

    /**
     * Called when the user indicates they want to close the preview window.
     */
    private onCloseDisplay() {
        this.displayPhoto(false);
        var loader = $('.content').children('.loader');
        loader.show();
    }

    /**
     * Initializes the view model given constructed PhotoModel objects.
     * @param photoModels The PhotoModels to initialize with.
     */
    private onInitialize(photoModels : PhotoModel[]) {
        for (var i : number = 0; i < photoModels.length; i++) {
            var model : PhotoModel = photoModels[i];
            var category : string = model.getCategory();

            if (!this.photoCategoryDictionary.hasOwnProperty(category)) {
                this.photoCategoryDictionary[category] = ko.observableArray<PhotoModel>([]);
                this.categories.push(category);
            }

            // Add to category collection
            this.photoCategoryDictionary[category].push(model);

            // Add to "all-photos" collection
            this.photos.push(model);
        }
        this.setCategory(FotoViewModel.CATEGORY_ALL);
    }

    /**
     * Loads photographs from a source and returns a list
     * of result PhotoModel through the given callback
     * @param source The source URL to request photo information from
     * @param callback The function that will receive the PhotoModel objects.
     */
    private loadPhotos(source : string, callback : Function) {
        $.get(source, (data) => {
            // Load photo models
            var photographs : PhotoModel[] = [];
            for (var i : number = 0; i < data.photos.length; i++) {
                photographs.push(new PhotoModel(data.photos[i].category, data.photos[i].path, data.cache));
            }
            callback(photographs);
        });
    }
}