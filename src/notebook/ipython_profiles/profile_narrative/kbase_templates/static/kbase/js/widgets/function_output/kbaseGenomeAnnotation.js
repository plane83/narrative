/**
 * Output widget for visualization of genome annotation.
 * @author Roman Sutormin <rsutormin@lbl.gov>
 * @public
 */

define(['jquery', 
//...deleting some code for clarity
        'jquery-dataTables-bootstrap'], 
        //Those are libraries or package needed for this widget
        
        
    function($, ContigBrowserPanel) {
    $.KBWidget({
        name: "kbaseGenomeView",
        parent: "kbaseAuthenticatedWidget",
        version: "1.0.0",
        //...deleting some code for clarity
        options: {
            ws_id: null, //this is the parameter passed into this widget.
            ws_name: null//this is the parameter passed into this widget.
            //those two parameters should be the same as in https://github.com/kbase/narrative_method_specs_ci/tree/master/methods/view_genome
            //You can access your workspace data using ws_id and ws_name in this widget
        },
        //...deleting some code for clarity

        init: function(options) {
            this._super(options);
            this.ws_name = options.ws_name;
            this.ws_id = options.ws_id;
            if (options.ws && options.id) {
                  this.ws_id = options.id;
                  this.ws_name = options.ws;
            }
            return this;
        },
        //...deleting some code for clarity
  

        render: function() {
            //...deleting some code for clarity

            var kbws = new Workspace(self.wsUrl, {'token': self.token});
        //...deleting some code for clarity
            var ready = function(gnm, ctg) {
            		container.empty();
            		var tabPane = $('<div id="'+pref+'tab-content">');
            		container.append(tabPane);
            		tabPane.kbaseTabs({canDelete : true, tabs : []});
        //...deleting some code for clarity
                    ////////////////////////////// Overview Tab //////////////////////////////
                    $('#'+pref+'overview').append('<table class="table table-striped table-bordered" \
                            style="margin-left: auto; margin-right: auto;" id="'+pref+'overview-table"/>');
                    var overviewLabels = ['KBase ID', 'Name', 'Domain', 'Genetic code', 'Source', "Source ID", "GC", "Taxonomy", "Size",
                                          "Number of Contigs", "Number of Genes"];
                   //...deleting some code for clarity
                    var overviewData = [gnm.id, '<a href="/functional-site/#/dataview/'+self.ws_name+'/'+self.ws_id+'" target="_blank">'+gnm.scientific_name+'</a>',
                                        gnm.domain, gnm.genetic_code, gnm.source, gnm.source_id, gc_content, tax, gnm.dna_size,
                                        contigCount, gnm.features.length];

                //...deleting some code for clarity


                    var overviewTable = $('#'+pref+'overview-table');
                    for (var i=0; i<overviewData.length; i++) {
                 //...deleting some code for clarity
                            overviewTable.append('<tr><td>'+overviewLabels[i]+'</td> \
                                    <td>'+overviewData[i]+'</td></tr>');
                     //...deleting some code for clarity
                    }

                    ///////////////////// Contigs and Genes (lazy loading) /////////////////////
                    var contigsDiv = $('#'+pref+'contigs');
                    contigsDiv.append("<div><img src=\""+self.loadingImage+"\">&nbsp;&nbsp;loading contig data...</div>");

                    var genesDiv = $('#'+pref+'genes');
                    genesDiv.append("<div><img src=\""+self.loadingImage+"\">&nbsp;&nbsp;loading genes data...</div>");
                    var genesAreShown = false;

                    var liElems = tabPane.find('li');
                    for (var liElemPos = 0; liElemPos < liElems.length; liElemPos++) {
                        var liElem = $(liElems.get(liElemPos));
                        var aElem = liElem.find('a');
                        if (aElem.length != 1)
                            continue;
                        var dataTab = aElem.attr('data-tab');
                        if (dataTab === 'Contigs' || dataTab === 'Genes') {
                            aElem.on('click', function() {
                                if (!genesAreShown) {
                                    genesAreShown = true;
                                    self.prepareGenesAndContigs(pref, kbws, gnm, tabPane);
                                }
                            });
                        }
                    }
            };

            container.empty();
            container.append("<div><img src=\""+self.loadingImage+"\">&nbsp;&nbsp;loading genome data...</div>");

            var included = ["/complete","/contig_ids","/contig_lengths","contigset_ref","/dna_size",
                            "/domain","/gc_content","/genetic_code","/id","/md5","num_contigs",
                            "/scientific_name","/source","/source_id","/tax_id","/taxonomy",
                            "/features/[*]/unknownfield", "/features/[*]/location"];
            kbws.get_object_subset([{ref: self.ws_name + "/" + self.ws_id, included: included}], function(data) {
                var gnm = data[0].data;
                if (gnm.contig_ids && gnm.contig_lengths && gnm.contig_ids.length == gnm.contig_lengths.length) {
                    ready(gnm, null);
                } else {
                    var contigSetRef = gnm.contigset_ref;
                    if (gnm.contigset_ref) {
                        kbws.get_object_subset([{ref: contigSetRef, included: ['contigs/[*]/unknownfield']}], function(data2) {
                            var ctg = data2[0].data;
                            ready(gnm, ctg);
                        }, function(data2) {
                            container.empty();
                            container.append('<p>[Error] ' + data2.error.message + '</p>');
                        });
                    } else {
                        container.empty();
                        container.append('Genome object has unsupported structure (no contig-set)');
                    }
                }
            }, function(data) {
                container.empty();
                container.append('<p>[Error] ' + data.error.message + '</p>');
            });
            return this;
        },

        prepareGenesAndContigs: function(pref, kbws, gnm, tabPane) {
            //...deleting some code for clarity
            kbws.get_object_subset(subsetRequests, function(data) {
                //...deleting some code for clarity
                var genesSettings = {
                        "sPaginationType": "full_numbers",
                        "iDisplayLength": 10,
                        "aaSorting": [[ 1, "asc" ], [2, "asc"]],
                        "aoColumns": [
                                      {sTitle: "Gene ID", mData: "id"},
                                      {sTitle: "Contig", mData: "contig"},
                                      {sTitle: "Start", mData: "start"},
                                      {sTitle: "Strand", mData: "dir"},
                                      {sTitle: "Length", mData: "len"},
                                      {sTitle: "Type", mData: "type"},
                                      {sTitle: "Function", mData: "func"}
                                      ],
                                      "aaData": [],
                                      "oLanguage": {
                                          "sSearch": "Search gene:",
                                          "sEmptyTable": "No genes found."
                                      },
                                      "fnDrawCallback": geneEvents
                };


               //...deleting some code for clarity

                var genesTable = $('#'+pref+'genes-table').dataTable(genesSettings);
                genesTable.fnAddData(genesData);

               //...deleting some code for clarity

                function showGene(geneId) {
                    var tabId = openTabGetId(geneId);
                    if (tabId == null) {
                        tabPane.kbaseTabs('showTab', geneId);
                        return;
                    }
                    var gene = geneMap[geneId];
                    var contigName = null;
                    var geneStart = null;
                    var geneDir = null;
                    var geneLen = null;
                    if (gene.location && gene.location.length > 0) {
                        contigName = gene.location[0][0];
                        geneStart = gene.location[0][1];
                        geneDir = gene.location[0][2];
                        geneLen = gene.location[0][3];
                    }
                    var geneType = gene.type;
                    var geneFunc = gene['function'];
                    var geneAnn = '';
                    if (gene['annotations'])
                        geneAnn = gene['annotations'];
                    $('#'+tabId).append('<table class="table table-striped table-bordered" \
                            style="margin-left: auto; margin-right: auto;" id="'+tabId+'-table"/>');
                    var elemLabels = ['Gene ID', 'Contig name', 'Gene start', 'Strand', 'Gene length', "Gene type", "Function", "Annotations"];
                    var elemData = ['<a href="/functional-site/#/genes/'+self.ws_name+'/'+self.ws_id+'/'+geneId+'" target="_blank">'+geneId+'</a>',
                                    '<a class="'+tabId+'-click2" data-contigname="'+contigName+'">' + contigName + '</a>',
                                    geneStart, geneDir, geneLen, geneType, geneFunc, geneAnn];
                    var elemTable = $('#'+tabId+'-table');
                    for (var i=0; i<elemData.length; i++) {
                        if (elemLabels[i] === 'Function') {
                            elemTable.append('<tr><td>' + elemLabels[i] + '</td> \
                                    <td><textarea style="width:100%;" cols="2" rows="3" readonly>'+elemData[i]+'</textarea></td></tr>');
                        } else if (elemLabels[i] === 'Annotations') {
                            elemTable.append('<tr><td>' + elemLabels[i] + '</td> \
                                    <td><textarea style="width:100%;" cols="2" rows="3" readonly>'+elemData[i]+'</textarea></td></tr>');
                        } else {
                            elemTable.append('<tr><td>'+elemLabels[i]+'</td> \
                                    <td>'+elemData[i]+'</td></tr>');
                        }
                    }
                    $('.'+tabId+'-click2').click(function() {
                        showContig($(this).data('contigname'));
                    });
                    tabPane.kbaseTabs('showTab', geneId);
                }

                //...deleting some code for clarity
        },

        getData: function() {
        	return {
        		type: "NarrativeTempCard",
        		id: this.ws_name + "." + this.ws_id,
        		workspace: this.ws_name,
        		title: "Temp Widget"
        	};
        },

        loggedInCallback: function(event, auth) {
            this.token = auth.token;
            this.render();
            return this;
        },

        loggedOutCallback: function(event, auth) {
            this.token = null;
            this.render();
            return this;
        },

        uuid: function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
                function(c) {
                    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                    return v.toString(16);
                });
        }
    });
});
