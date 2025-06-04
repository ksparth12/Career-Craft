import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import HeaderNav from "@/components/HeaderNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Building, Users, MapPin, ExternalLink, ArrowUpRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getDirectUser } from "@/utils/directAuth";
import { motion } from "framer-motion";

interface Company {
  id: string;
  name: string;
  industry?: string;
  location: string;
  size?: string;
  description?: string;
  logo_url?: string;
  website?: string;
  email?: string;
  created_at: string;
}

const Companies = () => {
  const { user } = useAuth();
  const directUser = getDirectUser();
  const userEmail = user?.email || directUser?.email || "";
  const isAdmin = userEmail === "ksparth12@gmail.com";

  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [industries, setIndustries] = useState<string[]>([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name");

      if (error) {
        throw error;
      }

      if (data) {
        setCompanies(data);
        setFilteredCompanies(data);

        // Extract unique industries
        const uniqueIndustries = Array.from(
          new Set(data.map((company) => company.industry).filter(Boolean))
        ) as string[];
        setIndustries(uniqueIndustries);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Filter companies based on search query and selected industry
    let results = companies;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (company) =>
          company.name.toLowerCase().includes(query) ||
          company.description?.toLowerCase().includes(query) ||
          company.location.toLowerCase().includes(query) ||
          company.email?.toLowerCase().includes(query)
      );
    }

    if (selectedIndustry) {
      results = results.filter((company) => company.industry === selectedIndustry);
    }

    setFilteredCompanies(results);
  }, [searchQuery, selectedIndustry, companies]);

  const handleIndustryClick = (industry: string) => {
    if (selectedIndustry === industry) {
      setSelectedIndustry(null);
    } else {
      setSelectedIndustry(industry);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeaderNav />
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center mb-10 animate-fade-in"
        >
          <h1 className="text-3xl font-bold mb-4 gradient-text-static">
            Explore Top Companies at Career Craft
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Discover leading companies that are hiring now. Find your perfect workplace match and build your dream career.
          </p>
          
          {/* Admin Action Button - Only visible to admin */}
          {isAdmin && (
            <Button 
              className="mt-4 bg-primary hover:bg-primary/90 text-white flex items-center gap-2 transition-all hover:-translate-y-1"
              onClick={() => alert('This would open the Add Company form')}
            >
              <Building className="h-4 w-4" /> Add New Company
            </Button>
          )}
        </motion.div>

        {/* Search and filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl mx-auto mb-8 animate-fade-in"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search companies by name, description, location or email..."
              className="pl-10 bg-white dark:bg-tertiary/5"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Industry filters */}
          {industries.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Filter by industry:</p>
              <div className="flex flex-wrap gap-2">
                {industries.map((industry, index) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.05 * index }}
                    key={industry}
                  >
                    <Badge
                      variant={selectedIndustry === industry ? "default" : "outline"}
                      className={`cursor-pointer hover:bg-primary/10 ${
                        selectedIndustry === industry ? "bg-primary text-white" : ""
                      }`}
                      onClick={() => handleIndustryClick(industry)}
                    >
                      {industry}
                    </Badge>
                  </motion.div>
                ))}
                {selectedIndustry && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6"
                    onClick={() => setSelectedIndustry(null)}
                  >
                    Clear filter
                  </Button>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Companies list */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <CardContent className="p-6 h-48"></CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCompanies.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredCompanies.map((company, index) => (
              <motion.div
                key={company.id}
                variants={itemVariants}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <Link
                  to={`/companies/${company.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden h-full border-primary/10 transition-all duration-300 hover:shadow-md hover:border-primary/30 bg-white/80 dark:bg-tertiary/5 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-14 w-14 rounded-md bg-tertiary/10 flex items-center justify-center">
                          {company.logo_url ? (
                            <img
                              src={company.logo_url}
                              alt={`${company.name} logo`}
                              className="h-12 w-12 object-contain"
                            />
                          ) : (
                            <Building className="h-7 w-7 text-tertiary" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium flex items-center text-lg">
                            {company.name}
                            <ArrowUpRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h3>
                          {company.industry && (
                            <Badge variant="outline" className="mt-1 text-xs bg-tertiary/5">
                              {company.industry}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary/70" />
                          <span>{company.location}</span>
                        </div>
                        
                        {company.size && (
                          <div className="flex items-start gap-2">
                            <Users className="h-4 w-4 mt-0.5 shrink-0 text-primary/70" />
                            <span>{company.size}</span>
                          </div>
                        )}
                        
                        {company.email && (
                          <div className="flex items-start gap-2">
                            <Mail className="h-4 w-4 mt-0.5 shrink-0 text-primary/70" />
                            <span className="truncate">{company.email}</span>
                          </div>
                        )}
                        
                        {company.website && (
                          <div className="flex items-start gap-2">
                            <ExternalLink className="h-4 w-4 mt-0.5 shrink-0 text-primary/70" />
                            <span className="truncate">{company.website.replace(/^https?:\/\//, '')}</span>
                          </div>
                        )}
                      </div>
                      
                      {company.description && (
                        <>
                          <Separator className="my-3" />
                          <p className="text-sm line-clamp-2">{company.description}</p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <Building className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
            <h3 className="text-xl font-medium mb-1">No companies found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            {(searchQuery || selectedIndustry) && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedIndustry(null);
                }}
              >
                Clear all filters
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Companies; 