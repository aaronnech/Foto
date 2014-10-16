/// <reference path="vendor/knockout.d.ts" />
/// <reference path="app/PhotoModel.ts" />
/// <reference path="app/FotoViewModel.ts" />
var vm : FotoViewModel = new FotoViewModel("gallery/serve.php");
ko.applyBindings(vm);