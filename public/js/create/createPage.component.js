import angular from 'angular';

export default angular.module('helloGov')
    .component('createPage', {
        template: require('./createPage.html'),
        controller: function ($http, constants, $location, $window, $scope) {
            'ngInject';
            let self = this;
            let isNew = true;
            $scope.federalSenateSelected = false;
            $scope.federalHouseSelected = false;
            $scope.stateSenateSelected = false;
            $scope.stateAssemblySelected = false;

            // FIXME: less brittle way to get campaignId, but still not using Angular's router
            let url = new URL($location.absUrl());

            // if on an edit page, then grab the campaignId from URL
            if (url.pathname.indexOf('/edit') !== -1) {
                var campaignId = url.pathname.replace('/edit', '').replace(/[/]/g, '');
                isNew = false;

                $http.get(`${constants.API_ROOT}/campaigns/${campaignId}`)
                    .then((resp) => {
                        self.campaign = resp.data;
                        $scope.federalSenateSelected = self.campaign.legislature_level.federal_senate;
                        $scope.federalHouseSelected = self.campaign.legislature_level.federal_house;
                        $scope.stateSenateSelected = self.campaign.legislature_level.state_senate;
                        $scope.stateAssemblySelected = self.campaign.legislature_level.state_assembly;
                    })
                    .catch(() => {
                        $window.location.href = '/home';
                    });
            }

            $scope.federalLegislatureSelected = function () {
                return $scope.federalSenateSelected || $scope.federalHouseSelected;
            };

            $scope.stateLegislatureSelected = function () {
                return $scope.stateSenateSelected || $scope.stateAssemblySelected;
            };

            $scope.updateLegislatureSelection = function () {
                const checked = event.target.checked;
                switch (event.target.name) {
                    case 'federal-senate':
                        $scope.federalSenateSelected = checked;
                        return;
                    case 'federal-house':
                        $scope.federalHouseSelected = checked;
                        return;
                    case 'state-senate':
                        $scope.stateSenateSelected = checked;
                        return;
                    case 'state-assembly':
                        $scope.stateAssemblySelected = checked;
                }
            };

            this.saveCampaign = function (publishFlag) {
                self.campaign.publish = publishFlag;
                if (isNew) {
                    $http.post(`${constants.API_ROOT}/campaigns`, self.campaign)
                        .then(function (resp) {
                            if (publishFlag) {
                                $window.location.href = `${resp.data.result.url}/success`;
                            } else {
                                $window.location.href = '/home';
                            }
                        })
                        .catch(function () {
                            self.error = 'There was an error creating your campaign. Please try again later.';
                        });
                } else {
                    $http.patch(`${constants.API_ROOT}/campaigns/${campaignId}`, self.campaign)
                        .then(function (resp) {
                            if (publishFlag) {
                                $window.location.href = `${resp.data.result.url}/success`;
                            } else {
                                $window.location.href = '/home';
                            }
                        })
                        .catch(function () {
                            self.error = 'There was an error saving your campaign. Please try again later.';
                        });
                }
            };
        }
    })
    .name;
